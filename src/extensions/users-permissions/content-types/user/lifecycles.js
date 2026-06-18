module.exports = {
  async afterUpdate(event) {
    const { result, params } = event;
    const user = result;

    // Verificar se o campo 'blocked' foi alterado
    if (!params.data || params.data.blocked === undefined) return;

    // Encontrar o artista associado a este user
    const artist = await strapi.db.query('api::artist.artist').findOne({
      where: { user: user.id },
      populate: { artworks: true, artist_quiz: true }
    });
    if (!artist) return;

    const newBlocked = params.data.blocked;
    const targetPublished = !newBlocked; // se blocked = true → isPublished = false

    // Atualizar artista
    await strapi.db.query('api::artist.artist').update({
      where: { id: artist.id },
      data: { isPublished: targetPublished }
    });

    // Atualizar todas as obras (artworks) do artista
    if (artist.artworks && artist.artworks.length) {
      await strapi.db.query('api::artwork.artwork').updateMany({
        where: { id: { $in: artist.artworks.map(a => a.id) } },
        data: { isPublished: targetPublished }
      });
    }

    // Atualizar quiz do artista (assumindo que é one-to-one)
    if (artist.artist_quiz) {
      await strapi.db.query('api::artist-quiz.artist-quiz').update({
        where: { id: artist.artist_quiz.id },
        data: { isPublished: targetPublished }
      });
    }
  }
};