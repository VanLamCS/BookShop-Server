import Book from '../models/Book.js'
import User from '../models/User.js'

export const getBooksByCategory = async (req, res, next) => {
    try {
        const { typeId } = req.query
        let listBooks = await Book.find({ typeId: typeId })
        if (!listBooks) {
            return res.status(404).json({
                message: "No books found", data: []
            })
        }
        return res.status(200).json({
            message: 'Get listBook by category successfully!!!',
            data: listBooks
        })
    } catch (err) {
        console.log(err)
    }

}

export const getBookById = async (req, res, next) => {
    let bookId = req.params.id
    let book
    try {
        book = await Book.findById(bookId)
    } catch (err) {
        console.log(err)
    }
    if (!book) {
        return res.status(404).json({ message: "No Book found" })
    }
    return res.status(200).json({
        message: 'Get a book successfully!!!',
        data: book
    })
}

export const addBook = async (req, res, next) => {
    try {
        const { name,
            publisher,
            typeId,
            userId,
            author,
            description,
            price,
            available,
            image,
            start
        } = req.body
        const user = await User.findById(userId)
        if (user && user.role == 'admin') {
            let book = new Book({
                name,
                publisher,
                author,
                description,
                price,
                available,
                image,
                start,
                typeId,
                numOfReview: 0
            })
            await book.save()
            if (!book) {
                return res.status(500).json({ message: "Unable To Add" })
            }
            return res.status(200).json({
                message: 'Create a book successfully!!!',
                data: book
            })
        }
        else {
            return res.status(500).json({ message: "Your account don\'t have permissions to update this book" })
        }
    } catch (err) {
        console.log(err)
    }
}

export const updateBook = async (req, res, next) => {
    try {
        const {
            name,
            publisher,
            typeId,
            userId,
            bookId,
            author,
            description,
            price,
            available,
            image,
            start
        } = req.body

        const user = await User.findById(userId);
        const book = await Book.findById(bookId);
        if (user && user.role == 'admin') {
            if(!book) {
                return res.status(200).json({
                    message: 'Book not found'
                });
            }
            const bookUpdate = {
                ...book.toObject(),
                name,
                publisher,
                typeId,
                userId,
                author,
                bookId,
                description,
                price,
                available,
                image,
                start
            }
            await Book.findByIdAndUpdate(bookId, bookUpdate);
            
            return res.status(200).json({
                message: 'Update Book successfully',
                data: bookUpdate
            });
        } else {
            return res.status(200).json({
                message: 'Your account don\'t have permissions to update this book'
            });
        }

    } catch (err) {
        console.log(err)
    }
}

export const deleteBook = async (req, res, next) => {
    try {
        const {
            bookId,
            userId
        } = req.body
        const user = await User.findById(userId)
        if(user && user.role == 'admin') {
            let book = await Book.findByIdAndRemove(bookId)
            if (!book) {
                return res.status(404).json({ message: "Your book not found" })
            }
            return res.status(200).json({ message: "Delete a book successfully" })
        }
        else {
            return res.status(404).json({ message: "Your account don\'t have permissions to delete this book" })
        }
    } catch (err) {
        console.log(err)
    }
}

export const updateStar = async (req, res, next) => {
    try {
      const { bookId, star } = req.body;
      const book = await Book.findById(bookId);
  
      if (!book) {
        return res.status(404).json({ message: "Book not found" });
      }
      console.log("check book: ", book)
      const totalStar = book.star * book.numOfReviews
      console.log("check star:  ", star)
      const newNumOfReviews = book.numOfReviews + 1
      const newStar = (totalStar + star) / newNumOfReviews
      
      const updateStarBook =  {
        ...book.toObject(),
        star: newStar.toFixed(1),
        numOfReviews: newNumOfReviews
    }
      await Book.findByIdAndUpdate(bookId, updateStarBook);
  
      return res.status(200).json({
        message: "Update star successfully",
        data: updateStarBook
      });
  
    } catch (err) {
      console.log(err);
    }
  }