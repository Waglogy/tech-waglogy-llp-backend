/**
 * Standardized API Response utility
 */
class ApiResponse {
  /**
   * Success response
   */
  static success(res, data, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({
      status: 'success',
      message,
      data
    });
  }

  /**
   * Error response
   */
  static error(res, message = 'Error', statusCode = 500, errors = null) {
    const response = {
      status: 'error',
      message
    };

    if (errors) {
      response.errors = errors;
    }

    return res.status(statusCode).json(response);
  }

  /**
   * Paginated response
   */
  static paginated(res, data, pagination, message = 'Success') {
    return res.status(200).json({
      status: 'success',
      message,
      data,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        totalPages: pagination.totalPages,
        totalRecords: pagination.totalRecords
      }
    });
  }
}

module.exports = ApiResponse;

