module.exports = {
  generateUniqueSlug: async (baseName) => {
    const slug = baseName
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    let uniqueSlug = slug;
    let counter = 1;
    while (await strapi.db.query('api::artist.artist').findOne({ where: { slug: uniqueSlug } })) {
      uniqueSlug = `${slug}-${counter++}`;
    }
    return uniqueSlug;
  }
};