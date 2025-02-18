export class UnauthorizedException extends Error {
  constructor(message) {
    super(message);
  }
}

export class Exception {
  
  static unauthorized(res, error) {

    if (error instanceof UnauthorizedException) {
      res.status(401).json({message: error.message});
    } else {
      res.status(400).json({message: error.message});
    }
    
  }

  static error(res, error) {

    const errors = []

    // Verifica se há erros dentro de `original.errors`
    if (error?.original?.errors && Array.isArray(error?.original?.errors)) {
        error.original.errors.forEach((err) => {
          errors.push(err.message)
        })
    } else {
      errors.push(error?.message)
    }

    res.status(500).json({errors})

  }

}