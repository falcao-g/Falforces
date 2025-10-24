const fs = require("fs")
const path = require("path")

class I18n {
	constructor({ defaultLocale = "en-US" } = {}) {
		this.defaultLocale = defaultLocale
		this.locales = this.loadLocales()
	}

	loadLocales() {
		const localesPath = path.join(__dirname, "..", "i18n")
		const locales = {}

		for (const file of fs.readdirSync(localesPath)) {
			if (!file.endsWith(".json")) continue
			const locale = file.replace(".json", "")
			locales[locale] = JSON.parse(fs.readFileSync(path.join(localesPath, file), "utf8"))
		}

		return locales
	}

	get(target, key, args = {}) {
		let locale = this.defaultLocale

		if (typeof target === "string") {
			locale = target // Directly passed locale like "pt-BR"
		} else if (target?.locale) {
			locale = target.locale // Interaction
		} else if (target?.guildLocale) {
			locale = target.guildLocale // Fallback for interactions/guilds
		} else if (target?.preferredLocale) {
			locale = target.preferredLocale // Guild object
		} // later we can add user-specific locale fetching from DB
		locale = locale.toLowerCase()

		let message = this.resolvePath(this.locales[locale], key) ?? this.resolvePath(this.locales[this.defaultLocale], key)

		if (!message) {
			console.error(`[i18n] Missing key "${key}" for locale "${locale}"`)
			return key
		}

		for (const [name, value] of Object.entries(args)) {
			message = message.replace(new RegExp(`{${name}}`, "g"), value)
		}

		if (this.userSchema && interaction.user?.id) {
			this.userSchema.findByIdAndUpdate(interaction.user.id, { locale }).catch(() => {})
		}

		return message
	}

	resolvePath(obj, pathStr) {
		return pathStr.split(".").reduce((acc, key) => acc?.[key], obj)
	}
}

module.exports = I18n
