class ApiResponce {
    constructor(statusCode, data , massage = 'Success') {
        this.massage = massage
        this.data = data
        this.success = statusCode < 400
    }
}

export { ApiResponce }