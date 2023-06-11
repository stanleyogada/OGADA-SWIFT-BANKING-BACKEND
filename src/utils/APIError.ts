class APIError extends Error {
  statusCode?: number;
  status: string;
  isAPIError: boolean;

  constructor(message: string, statusCode?: number) {
    super(message);

    this.message = message;
    this.statusCode = statusCode;
    this.status = statusCode >= 400 ? "fail" : "error";
    this.isAPIError = true;
  }
}

export default APIError;
