class ApiErrors extends Error {
    constructor(
        statusCode,
        massage = 'Something went wrong',
        errors = [],
         statck = ''
    ){
        super(massage)
        this.statusCode = statusCode
        this.data = null
        this.errors = errors
        this.massage = massage
        this.success = false 


        if(statck){
            this.stack = statck
        }else{
            Error.captureStackTrace(this, this.constructor); 
        }

    }
}

export { ApiErrors}