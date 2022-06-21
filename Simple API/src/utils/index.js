/* eslint-disable camelcase */
const mapDBToModelAlbum = ({
  id,
  name,
  year,
  created_at,
  updated_at,
}) => ({
  id,
  name,
  year: parseInt(year, 10),
  createdAt: created_at,
  updatedAt: updated_at,
});
const mapDBToModelSong = ({
  id,
  title,
  year,
  performer,
  genre,
  duration,
  albumId,
  created_at,
  updated_at,
}) => ({
  id,
  title,
  year: parseInt(year, 10),
  performer,
  genre,
  duration: parseInt(duration, 10),
  albumId,
  createdAt: created_at,
  updatedAt: updated_at,
});

const mapDBToModelSongs = ({
  id,
  title,
  performer,
}) => ({
  id,
  title,
  performer,
});

module.exports = { mapDBToModelAlbum, mapDBToModelSong, mapDBToModelSongs };
