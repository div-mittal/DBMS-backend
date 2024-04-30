class ApiResponse {
  constructor(statusCode, message = "Success", data) {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.succees = statusCode < 400;
  }
} 

export { ApiResponse };