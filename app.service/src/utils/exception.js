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
    res.status(500).json({message: error.message});
  }

}