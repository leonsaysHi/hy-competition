
import { createI18n } from 'vue-i18n'
import es from '@/i18n/es.js'
const i18n = createI18n({
    locale: 'es',
    allowComposition: true,
    messages: {
        es
    },
})

export default i18n