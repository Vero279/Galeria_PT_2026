async function generateUniqueSlug(baseName) {
  // Transformar baseName num slug base (sem acentos, minúsculas, hífen)
  const baseSlug = baseName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  let slug = baseSlug;
  let counter = 1;

  // Verifica se já existe algum artista com este slug
  while (await strapi.db.query('api::artist.artist').findOne({ where: { slug } })) {
    slug = `${baseSlug}-${counter++}`;
  }
  return slug;
}

module.exports = {
  async beforeCreate(event) {
    const { data } = event.params;
    if (data.name) {
      data.slug = await generateUniqueSlug(data.name);
    }
  },
  async beforeUpdate(event) {
    const { data, where } = event.params;
    if (data.name) {
      // Busca o artista actual (ignorando‑o na verificação)
      const existing = await strapi.db.query('api::artist.artist').findOne({ where });
      if (existing && existing.name !== data.name) {
        data.slug = await generateUniqueSlug(data.name);
      }
    }
  },
};
