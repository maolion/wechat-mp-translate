
export default {
    querySuggestions(value) {
        let sourceLang = this.data.langs.mapping[this.data.sourceLang];
        let destLang = this.data.langs.mapping[this.data.destLang];
        console.log(destLang);
    }
}
