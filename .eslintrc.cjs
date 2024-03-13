const defaultRules = {
	// Enforce prettier formatting
	'prettier/prettier': 'error',
	'padding-line-between-statements': 'off',
	'lines-between-class-members': ['error', 'always', { exceptAfterSingleLine: true }],
	'no-nested-ternary': 'error',
	curly: ['error', 'multi-line'],
}

module.exports = {
	// Stop looking for ESLint configurations in parent folders
	root: true,
	// Global variables: Browser and Node.js
	env: {
		browser: true,
		node: true,
	},
	// Basic configuration for js files
	plugins: ['@typescript-eslint', 'prettier'],
	extends: ['eslint:recommended', 'prettier'],
	rules: defaultRules,
	parserOptions: {
		ecmaVersion: 2022,
		sourceType: 'module',
	},
	overrides: [
		// Configuration for ts/vue files
		{
			files: ['*.ts', '*.vue'],
			parser: 'vue-eslint-parser',
			parserOptions: {
				parser: '@typescript-eslint/parser',
			},
			extends: [
				'plugin:vue/vue3-recommended',
				'eslint:recommended',
				'plugin:@typescript-eslint/recommended',
				'prettier',
			],
			rules: {
				...defaultRules,
				'vue/multi-word-component-names': 'off',
				//which bans the use of ( as type) in TS
				'vue/valid-v-model': 'off',
				'vue/require-default-prop': 'off',
				'vue/no-parsing-error': 'off',
				'no-constant-condition': 'off',
				'vue/no-v-html': 'off',
				'vue/v-on-event-hyphenation': 'off',
				'@typescript-eslint/ban-types': 'off',
				// It's recommended to turn off this rule on TypeScript projects
				// Allow ts-directive comments (used to suppress TypeScript compiler errors)
				'@typescript-eslint/ban-ts-comment': 'off',
				// Allow usage of the any type (consider to enable this rule later on)
				'@typescript-eslint/no-explicit-any': 'off',
				// Allow usage of require statements (consider to enable this rule later on)
				'@typescript-eslint/no-var-requires': 'off',
				// Allow non-null assertions for now (consider to enable this rule later on)
				'@typescript-eslint/no-non-null-assertion': 'off',
				// Allow unused arguments and variables when they begin with an underscore
				'@typescript-eslint/no-unused-vars': 'off',
				'@typescript-eslint/no-empty-function': 'off',
			},
		},
	],
}
