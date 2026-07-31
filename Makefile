ci-local:
	npm run build
	test -f dist/client/pagefind/pagefind.js
	npm run test:e2e
