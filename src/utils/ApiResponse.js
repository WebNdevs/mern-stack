class ApiResponce {
    constructor(data, massage = 'Success', statusCode) {
        this.massage = massage
        this.data = data
        this.success = statusCode < 400
    }
}

export { ApiResponce }