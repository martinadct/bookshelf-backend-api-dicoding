const { nanoid } = require('nanoid');
const books = require('./books');

const addBookHandler = (request, h) => {
  const {
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    reading,
  } = request.payload;

  const id = nanoid(16);

  // Jika Client tidak melampirkan properti name pada request body
  if (typeof name === 'undefined') {
    const response = h.response({
      status: 'fail',
      message: 'Gagal menambahkan buku. Mohon isi nama buku',
    });
    response.code(400);
    return response;
  }

  // Jika Client memberikan nilai properti readPage lebih besar daripada nilai properti pageCount
  if (readPage > pageCount) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount',
    });
    response.code(400);
    return response;
  }

  // Mengecek jika buku telah dibaca sepenuhnya
  const finished = (pageCount === readPage);
  const insertedAt = new Date().toISOString();
  const updatedAt = insertedAt;

  const newBook = {
    id,
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    finished,
    reading,
    insertedAt,
    updatedAt,
  };

  books.push(newBook); // Memasukkan buku baru ke books array

  // Mengecek keberhasilan memasukkan buku baru ke books array
  const isSuccess = books.filter((book) => book.id === id).length > 0;

  // Jika buku berhasil dimasukkan atau ditambahkan
  if (isSuccess) {
    const response = h.response({
      status: 'success',
      message: 'Buku berhasil ditambahkan',
      data: {
        bookId: id,
      },
    });
    response.code(201);
    return response;
  }

  // Kemungkinan lain, jika Server gagal memasukkan buku karena alasan umum (generic error)
  const response = h.response({
    status: 'error',
    message: 'Buku gagal ditambahkan',
  });
  response.code(500);
  return response;
};

const getBooksHandler = (request, h) => {
  const { name, reading, finished } = request.query;

  // Jika Client mencari buku berdasarkan nama buku
  if (name) {
    const nameSearched = name.toLowerCase();
    const bookList = books
      .filter((book) => book.name.toLowerCase().includes(nameSearched))
      .map((book) => ({
        id: book.id,
        name: book.name,
        publisher: book.publisher,
      }));

    const response = h.response(
      {
        status: 'success',
        data:
        {
          books: bookList,
        },
      },
    );
    response.code(200);
    return response;
  }

  // Jika Client mencari buku berdasarkan status membaca

  if (reading) {
    const bookList = books
      .filter((book) => book.reading === (reading === '1'))
      .map((book) => ({
        id: book.id,
        name: book.name,
        publisher: book.publisher,
      }));
    const response = h.response(
      {
        status: 'success',
        data:
        {
          books: bookList,
        },
      },
    );
    response.code(200);
    return response;
  }

  // Jika Client mencari buku berdasarkan status selesai
  if (finished) {
    const bookList = books
      .filter((book) => book.finished === (finished === '1'))
      .map((book) => ({
        id: book.id,
        name: book.name,
        publisher: book.publisher,
      }));
    const response = h.response(
      {
        status: 'success',
        data:
        {
          books: bookList,
        },
      },
    );
    response.code(200);
    return response;
  }

  // Lainnya, jika Client ingin semua buku
  const response = h.response(
    {
      status: 'success',
      data:
      {
        books: books.map((book) => ({
          id: book.id,
          name: book.name,
          publisher: book.publisher,
        })),
      },
    },
  );
  response.code(200);
  return response;
};

const getBookByIdHandler = (request, h) => {
  const { bookId } = request.params;

  // Mencari buku dengan menggunakan Id
  const book = books.filter((b) => b.id === bookId)[0];

  // Jika buku dengan Id yang diberikan oleh Client ditemukan
  if (book) {
    const response = h.response({
      status: 'success',
      data: {
        book,
      },
    });
    response.code(200);
    return response;
  }

  // Jika buku dengan Id yang diberikan oleh Client tidak ditemukan
  const response = h.response({
    status: 'fail',
    message: 'Buku tidak ditemukan',
  });
  response.code(404);
  return response;
};

const editBookByIdHandler = (request, h) => {
  const { bookId } = request.params;

  const {
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    reading,
  } = request.payload;

  // Jika suatu buku sudah dibaca sepenuhnya
  const finished = (pageCount === readPage);

  // Jika Client tidak memberikan properti name pada request body (buku)
  if (typeof name === 'undefined') {
    const response = h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. Mohon isi nama buku',
    });
    response.code(400);
    return response;
  }

  // Jika Client memberikan nilai properti readPage lebih dari nilai properti pageCounter
  if (readPage > pageCount) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount',
    });
    response.code(400);
    return response;
  }

  const updatedAt = new Date().toISOString();

  const index = books.findIndex((book) => book.id === bookId);

  if (index !== -1) {
    books[index] = {
      ...books[index],
      name,
      year,
      author,
      summary,
      publisher,
      pageCount,
      readPage,
      finished,
      reading,
      updatedAt,
    };

    // Jika buku berhasil diperbarui
    const response = h.response({
      status: 'success',
      message: 'Buku berhasil diperbarui',
    });
    response.code(200);
    return response;
  }

  // Jika Id yang diberikan tidak dapat ditemukan di server, return error
  const response = h.response({
    status: 'fail',
    message: 'Gagal memperbarui buku. Id tidak ditemukan',
  });
  response.code(404);
  return response;
};

const deleteBookByIdHandler = (request, h) => {
  const { bookId } = request.params;

  const index = books.findIndex((book) => book.id === bookId);

  if (index !== -1) {
    books.splice(index, 1);
    // Jika Id yang diberikan merupakan Id salah satu buku
    const response = h.response({
      status: 'success',
      message: 'Buku berhasil dihapus',
    });
    response.code(200);
    return response;
  }

  // Jika Id yang diberikan bukan merupakan Id suatu buku, return error
  const response = h.response({
    status: 'fail',
    message: 'Buku gagal dihapus. Id tidak ditemukan',
  });
  response.code(404);
  return response;
};

module.exports = {
  addBookHandler,
  getBooksHandler,
  getBookByIdHandler,
  editBookByIdHandler,
  deleteBookByIdHandler,
};
