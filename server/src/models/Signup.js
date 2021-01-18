const Model = require("./Model")

class Signup extends Model {
  static get tableName(){
    return "signups"
  }

   static get relationMappings(){
    const Club = require("./Club")
    const Student = require("./Student")

    return {
      club: {
        relation: Model.BelongsToOneRelation,
        modelClass: Club, 
        join: {
          from: "signups.clubId",
          to: "clubs.id"
        }
      },
      student: {
        relation: Model.BelongsToOneRelation,
        modelClass: Student,
        join: {
          from: "signups.studentId",
          to: "students.id"
        }
      }
    }
  }
}

module.exports = Signup