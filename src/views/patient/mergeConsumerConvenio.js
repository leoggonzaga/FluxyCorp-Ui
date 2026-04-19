/** Junta dados de Consumer + primeiro convênio ativo + operadoras para o prontuário / formulário. */

const pick = (o, ...keys) => {
    for (const k of keys) {
        if (o && o[k] != null && o[k] !== '') return o[k]
    }
    return ''
}

export function mergeConsumerConvenioForUi(base, convenios, operadoras = []) {
    if (!base) return null
    const list = Array.isArray(convenios) ? convenios : []
    const conv = list[0] ?? null
    const oid = conv ? pick(conv, 'operadoraPublicId', 'OperadoraPublicId') : ''
    const op = oid
        ? (operadoras || []).find((o) => String(pick(o, 'publicId', 'PublicId')) === String(oid))
        : null

    if (!conv) {
        return {
            ...base,
            convenioOperadoraPublicId: null,
            convenioPublicId: '',
            insurancePublicId: '',
            insuranceName: '',
            insurancePlan: '',
            insuranceNumber: '',
            insuranceExpiry: '',
            insuranceHolder: '',
        }
    }

    const v = pick(conv, 'validade', 'Validade')
    const expiryIso =
        v == null || v === ''
            ? ''
            : typeof v === 'string'
              ? v.includes('T')
                  ? v
                  : `${v}T00:00:00`
              : new Date(v).toISOString()

    return {
        ...base,
        convenioOperadoraPublicId: oid || null,
        convenioPublicId: pick(conv, 'publicId', 'PublicId') || '',
        insurancePublicId: oid || '',
        insuranceName: pick(op, 'name', 'Name') || pick(base, 'insuranceName', 'insurance') || '',
        insurancePlan: pick(conv, 'plano', 'Plano') || '',
        insuranceNumber: pick(conv, 'numero', 'Numero') || '',
        insuranceExpiry: expiryIso,
        insuranceHolder: pick(conv, 'titular', 'Titular') || '',
    }
}
