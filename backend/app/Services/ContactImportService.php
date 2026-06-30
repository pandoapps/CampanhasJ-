<?php

namespace App\Services;

use App\Models\Tag;
use App\Models\User;
use Illuminate\Http\UploadedFile;

class ContactImportService
{
    public function import(User $user, UploadedFile $file): array
    {
        $handle = fopen($file->getRealPath(), 'r');

        $header = fgetcsv($handle);
        $columns = $this->mapHeader($header ?: []);

        $imported = 0;
        $skipped = 0;
        $duplicates = 0;

        $existingPhones = $user->contacts()->pluck('phone')->all();
        $tagCache = $user->tags()->pluck('id', 'name')->all();

        while (($row = fgetcsv($handle)) !== false) {
            $name = trim($row[$columns['name']] ?? '');
            $phone = trim($row[$columns['phone']] ?? '');

            if ($name === '' || $phone === '') {
                $skipped++;
                continue;
            }

            if (in_array($phone, $existingPhones, true)) {
                $duplicates++;
                continue;
            }

            $email = isset($columns['email']) ? trim($row[$columns['email']] ?? '') : '';
            $tagNames = isset($columns['tags']) ? trim($row[$columns['tags']] ?? '') : '';

            $contact = $user->contacts()->create([
                'name' => $name,
                'phone' => $phone,
                'email' => $email !== '' ? $email : null,
            ]);

            if ($tagNames !== '') {
                $tagIds = [];
                foreach (array_filter(array_map('trim', explode(',', $tagNames))) as $tagName) {
                    if (!isset($tagCache[$tagName])) {
                        $tagCache[$tagName] = $user->tags()->create(['name' => $tagName])->id;
                    }
                    $tagIds[] = $tagCache[$tagName];
                }
                $contact->tags()->sync($tagIds);
            }

            $existingPhones[] = $phone;
            $imported++;
        }

        fclose($handle);

        return [
            'imported' => $imported,
            'duplicates' => $duplicates,
            'skipped' => $skipped,
        ];
    }

    private function mapHeader(array $header): array
    {
        $normalized = array_map(fn ($h) => mb_strtolower(trim((string) $h)), $header);

        $find = function (array $aliases) use ($normalized) {
            foreach ($aliases as $alias) {
                $index = array_search($alias, $normalized, true);
                if ($index !== false) {
                    return $index;
                }
            }
            return null;
        };

        $name = $find(['nome', 'name']) ?? 0;
        $phone = $find(['telefone', 'phone', 'whatsapp']) ?? 1;
        $email = $find(['email', 'e-mail']);
        $tags = $find(['tags', 'tag']);

        $columns = ['name' => $name, 'phone' => $phone];
        if ($email !== null) {
            $columns['email'] = $email;
        }
        if ($tags !== null) {
            $columns['tags'] = $tags;
        }

        return $columns;
    }
}
