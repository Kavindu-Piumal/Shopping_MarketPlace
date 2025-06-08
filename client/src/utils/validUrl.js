const validUrl = (name) => {
    if (!name || typeof name !== 'string') return '';
    return name.replaceAll(' ', '-').replaceAll(',', '-');
};

export default validUrl;