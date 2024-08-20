
class ApiErrors2 extends Error {
    constructor(
        statusCode,
        massage = "Something went wrong",
        success = false,
        errors = [],
        stack = ''

    ) {

        super(massage);

        this.statusCode = statusCode
        this.massage = massage
        this.data = null
        this.success = success
        this.errors = errors


        if(stack){
            this.stack = stack
        }else{
            Error.captureStackTrace(this , this.constructor);
        }

    }

    
}






























































class ApiErrors extends Error {
    constructor(
        statusCode,
        massage = 'Something went wrong',
        errors = [],
        statck = ''
    ) {
        super(massage)
        this.statusCode = statusCode
        this.data = null
        this.errors = errors
        this.massage = massage
        this.success = false


        if (stack) {
            this.stack =stack
        } else {
            Error.captureStackTrace(this, this.constructor);
        }

    }
}

export { ApiErrors  }