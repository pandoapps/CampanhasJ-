.PHONY: up up-prod down migrate seed fresh deploy send db thinker shell install build lint \
        worker worker-logs evolution-logs evolution-restart evolution-shell evolution-ps

up:
	docker compose --profile dev up -d

up-prod:
	docker compose --profile prod up -d

down:
	docker compose down

migrate:
	docker compose exec php php /var/www/html/backend/artisan migrate

seed:
	docker compose exec php php /var/www/html/backend/artisan db:seed

fresh:
	docker compose exec php php /var/www/html/backend/artisan migrate:fresh --seed

deploy:
	git pull origin main
	npm run build
	docker compose --profile prod up -d --build
	docker compose exec php php /var/www/html/backend/artisan migrate --force
	docker compose exec php php /var/www/html/backend/artisan config:cache
	docker compose exec php php /var/www/html/backend/artisan route:cache
	docker compose exec php php /var/www/html/backend/artisan view:cache

send:
	npm run lint
	@read -p "Mensagem do commit: " msg; \
	git add -A && \
	git commit -m "$$msg" && \
	git push

db:
	docker compose exec mysql mysql -u campanhasja -psecret campanhasja

thinker:
	docker compose exec php php /var/www/html/backend/artisan tinker

shell:
	docker compose exec php sh

install:
	cd backend && composer install
	npm install

build:
	npm run build

lint:
	npm run lint

# ─── Queue Worker ─────────────────────────────────────────────────────────────
worker:
	docker compose up -d queue-worker

worker-logs:
	docker compose logs -f queue-worker

# ─── Evolution API ────────────────────────────────────────────────────────────
evolution-logs:
	docker compose logs -f evolution-api

evolution-restart:
	docker compose restart evolution-api

evolution-shell:
	docker compose exec evolution-api sh

evolution-ps:
	docker compose ps evolution-api evolution-postgres evolution-manager
