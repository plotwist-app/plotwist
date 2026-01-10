include .env

.PHONY: setup
setup:
	cp .env.example .env
	pnpm i
	make compose-up

.PHONY: run
run:
	pnpm run dev

.PHONY: test
test:
	pnpm run test

.PHONY: lint
lint:
	pnpm run lint

.PHONY: format
format:
	pnpm run format

.PHONY: build
build:
	pnpm run build
	
.PHONY: compose-down
compose-down:
	docker compose down
	
.PHONY: compose-up
compose-up:
	@echo "up docker compose"
	docker compose up -d --scale app=0
	
	
