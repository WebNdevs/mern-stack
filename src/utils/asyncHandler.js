const asyncHandler = (requestHandler) =>{

    (req, res, next)=>{
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err))
    }

}





/*
const asyncHandler =  (fn)=> async (req, res, next)=>{

    try {
        
    } catch (error) {

        await fn(req, res, next)

        res.status(err.code || 400).json({
            success: false,
            massage : error.massage 
        })
        
    }

}

*/