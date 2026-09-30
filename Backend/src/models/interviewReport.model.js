const mongoose = require('mongoose');
//Job description
//Resume text
// Self description
//Ai should give Technical questions Behavioral questions Skill gaps and preparation plans
const technicalQuestionSchema = new mongoose.Schema({
    question:{
        type:String,
        required:[true,"Technical question is required"]
    },
    intention:{
        type:String,
        required:[true,"Intention is required"]
    },
    answer:{
         type:String,
         required:[true,"Answer is required"]
    }
},{
    _id:false
})
const behavioralQuestionSchema = new mongoose.Schema({
       question:{
        type:String,
        required:[true,"Behavioral question is required"]
    },
    intention:{
        type:String,
        required:[true,"Intention is required"]
    },
    answer:{
         type:String,
         required:[true,"Answer is required"]
    }
},{
    _id:false
})
const skillGapSchema= new mongoose.Schema({
    skill:{
        type:String,
        required:[true,"Skill is requires"]
    },
    severity:{
        type:String,
        enum:["low","medium","high"],
        required:[true,"Severity is required"]
    }
},{
    _id:false
})
const preparationPlanSchema = new mongoose.Schema({
    day:{
        type:Number,
        required:[true,"Focus is required"]
    },
    focus:{
        type:String,
        required:[true,"Focus is required"]
    },
    tasks:[{
        type:String,
        required:[true,"Task is required"]
    }]
})
 const interviewReportSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'users',
        required:true
    },
    jobDescription:{
        type:String,
        required:[true,"Job description is required"]
    },
    resume:{
        type:String,
    },
    selfDescription:{
        type:String,
    },
    aiConsentAt:{
        type:Date,
        required:true
    },
    summary:{
        type:String,
        required:true
    },
    matchScore:{
        type:Number,
        required:true,
        min:0,
        max:100,
    },
    technicalQuestions:[technicalQuestionSchema],
    behavioralQuestions:[behavioralQuestionSchema],
    skillGaps:[skillGapSchema],
    preparationPlan:[preparationPlanSchema]
 },{
    timestamps:true
 })

interviewReportSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('InterviewReport', interviewReportSchema);
