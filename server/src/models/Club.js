const Model = require("./Model")

class Club extends Model {
  static get tableName(){
    return "clubs"
  }

  static get relationMappings(){
    const Student = require("./Student.js")
    const Signup = require("./Signup.js")

    return {
      students: {
        relation: Model.ManyToManyRelation,
        modelClass: Student, 
        join: {
          from: "clubs.id",
          through: {
            from: "signups.clubId",
            to: "signups.studentId"
          },
          to: "students.id"
        }
      },
      signups: {
        relation: Model.HasManyRelation,
        modelClass: Signup, 
        join: {
          from: "clubs.id",
          to: "signups.clubId"
        }
      }
    }
  }

  static get jsonSchema() {
    return {
      type: "object", 
      required: ["name"],
      properties: {
        name: { type: "string"}
      }
    }
  }
}

module.exports = Club