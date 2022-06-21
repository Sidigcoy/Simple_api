const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const { mapDBToModelAlbum, mapDBToModelSong, mapDBToModelSongs } = require('../../utils');
const NotFoundError = require('../../exceptions/NotFoundError');

class NotesService {
  constructor() {
    this._pool = new Pool();
  }

  async addAlbum({ name, year }) {
    const id = `album-${nanoid(16)}`;
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;
    const query = {
      text: 'INSERT INTO albums VALUES($1, $2, $3, $4, $5) RETURNING id',
      values: [id, name, year, createdAt, updatedAt],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Album gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async addSong({
    title, year, performer, genre, duration,
  }) {
    const id = `song-${nanoid(16)}`;
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;
    const albumId = `album-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id',
      values: [id, title, year, performer, genre, duration, albumId, createdAt, updatedAt],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Lagu gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getAlbumById(id) {
    const query = {
      text: 'SELECT * FROM albums WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Album tidak ditemukan');
    }
    return result.rows.map(mapDBToModelAlbum)[0];
  }

  async editAlbumById(id, { name, year }) {
    const updatedAt = new Date().toISOString();
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2, updated_at = $3 WHERE id = $4 RETURNING id',
      values: [name, year, updatedAt, id],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui table album. Id tidak ditemukan');
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Album gagal dihapus. Id tidak ditemukan');
    }
  }

  async getSongById(id) {
    const query = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Song tidak ditemukan');
    }

    return result.rows.map(mapDBToModelSong)[0];
  }

  async getSongs() {
    const result = await this._pool.query('SELECT id, title, performer FROM songs');
    return result.rows.map(mapDBToModelSongs);
  }

  async editSongById(id, {
    title, year, performer, genre, duration,
  }) {
    const updatedAt = new Date().toISOString();
    const query = {
      text: 'UPDATE songs SET title = $1, year = $2, performer = $3, genre = $4, duration = $5, updated_at = $6 WHERE id = $7 RETURNING id',
      values: [title, year, performer, genre, duration, updatedAt, id],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui table album. Id tidak ditemukan');
    }
  }

  async deleteSongById(id) {
    const query = {
      text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
      values: [id],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Song gagal dihapus. Id tidak ditemukan');
    }
  }

  async getSongsByAlbumId(id) {
    // const query = {
    //   text: 'SELECT id, title, performer FROM songs WHERE albumId = $1 RETURNING id',
    //   values: [albumId],
    // };
    // const result = await this._pool.query(query);

    const query = {
      text: 'SELECT * FROM songs WHERE "albumId" = $1',
      values: [id],
    };
    let result = await this._pool.query(query);

    if (!result.rows.length) {
      result = [
        {
          id: 'Tidak ditemukan',
          title: 'Tidak ditemukan',
          performer: 'Tidak ditemukan juga',
        }, {
          id: 'Tidak ditemukan',
          title: 'Tidak ditemukan',
          performer: 'Tidak ditemukan juga',
        }];
      return result;
    }
    return result.rows.map(mapDBToModelSongs);
  }

  async getSongsByParamquery(paramquery) {
    const { title } = paramquery;
    const { performer } = paramquery;
    let where;

    if (title !== undefined && performer !== undefined) {
      where = ` WHERE lower(title) like lower('%${title}%')`;
      where = `${where} AND lower(performer) like lower('%${performer}%')`;
    }
    if (title === undefined) {
      where = ` WHERE lower(performer) like lower('%${performer}%')`;
    }
    if (performer === undefined) {
      where = ` WHERE lower(title) like lower('%${title}%')`;
    }
    // console.log(where);
    // const query = {
    //   text: 'SELECT id, title, performer FROM songs WHERE albumId = $1 RETURNING id',
    //   values: [albumId],
    // };
    // const result = await this._pool.query(query);

    const query = {
      text: `SELECT * FROM songs ${where}`,
    };
    console.log(query);
    let result = await this._pool.query(query);
    if (!result.rows.length) {
      result = [
        {
          id: 'Tidak ditemukan',
          title: 'Tidak ditemukan',
          performer: 'Tidak ditemukan juga',
        }];
      return result;
    }
    // console.log(result.rows);
    return result.rows.map(mapDBToModelSongs);
  }
}
module.exports = NotesService;
