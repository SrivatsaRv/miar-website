ci-local:
	npm run build
	test -f dist/client/search-index.json
	npm run test:e2e
