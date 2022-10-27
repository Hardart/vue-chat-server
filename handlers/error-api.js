module.exports = class ErrorApi extends Error {
   status
   errors
   constructor(status = Number(), message = String(), errors = Array()) {
      super(message)
      this.status = status
      this.errors = errors
   }

   static UnathorizedError() {
      return new ErrorApi(401, 'Пользователь не авторизован')
   }

   static BadRequest(message, errors = Array()) {
      return new ErrorApi(400, message, errors)
   }

   static AccessDenied() {
      return new ErrorApi(403, 'Недостаточно прав')
   }

   static UploadError() {
      return new ErrorApi(409, 'Ошибка загрузки')
   }
}
