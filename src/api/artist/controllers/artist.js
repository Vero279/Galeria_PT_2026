// src/api/artist/controllers/artist.js
'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::artist.artist', ({ strapi }) => ({
  // Método personalizado para gerar slug único a partir de um username
  async generateSlug(ctx) {
    const { username } = ctx.request.body;
    if (!username) {
      return ctx.badRequest('username é obrigatório');
    }

    // Slug base: remove acentos, minúsculas, substitui espaços por hífen
    const baseSlug = username
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    let slug = baseSlug;
    let counter = 1;

    // Verifica se já existe um artista com este slug (campo uid)
    // Nota: o tipo uid do Strapi já garante unicidade, mas esta verificação extra é segura
    while (await strapi.db.query('api::artist.artist').findOne({ where: { slug } })) {
      slug = `${baseSlug}-${counter++}`;
    }

    ctx.send({ slug });
  }
}));