const asyncHandler2 = (requestHandler) => {
    (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch(err => next(err))
    }
}


// const asyncHandler2 = (fn) = async (req, res, next) => {

//     try {

//         await fn(req, res, next)

//     } catch (error) {


//         res.status(error.code || 400).json({
//             success: false,
//             massage: error.massage
//         })

//     }

// }


export { asyncHandler2 };





























































































const asyncHandler = (requestHandler) => {

    (req, res, next) => {
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