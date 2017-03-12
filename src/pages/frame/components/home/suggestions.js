
export default {
    querySuggestions(value) {
        let sourceLang = this.data.langMapping[this.data.sourceLang];
        let destLang = this.data.langMapping[this.data.destLang];
        let nextSuggestionUids = [];
        let translationMapping = this.data.translationMapping;

        value = (value||'').toLowerCase();

        for (let key of Object.keys(translationMapping)) {
            if (!value) {
                break;
            }

            let translation = translationMapping[key];

            if (translation.source.lang != sourceLang ||
                translation.dest.lang != destLang
            )  {
                continue;
            }

            if (translation.source.content.toLowerCase().indexOf(value) !== -1) {
                nextSuggestionUids.push(translation.uid);
            }
        }

        let currentSuggestionUids = this.data.suggestionUids;

        if ((!currentSuggestionUids || currentSuggestionUids.length === 0)  &&
            nextSuggestionUids.length === 0) {
                return;
        }

        if (currentSuggestionUids && currentSuggestionUids.length &&
            currentSuggestionUids.length === nextSuggestionUids.length) {
            let ignore = true;

            for (let uid of nextSuggestionUids) {
                if (currentSuggestionUids.indexOf(uid) === -1) {
                    ignore = false;
                    break;
                }
            }

            if (ignore) {
                return;
            }
        }

        this.setData({
            suggestionUids: nextSuggestionUids
        });
    }
}
