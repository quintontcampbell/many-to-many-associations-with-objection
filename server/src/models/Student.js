const Model = require("./Model")

class Student extends Model {
  static get tableName(){
    return "students"
  }

  static get relationMappings(){
    const Club = require("./Club")
    const Signup = require("./Signup")

    return {
      clubs: {
        relation: Model.ManyToManyRelation,
        modelClass: Club, 
        join: {
          from: "students.id",
          through: {
            from: "signups.studentId",
            to: "signups.clubId"
          },
          to: "clubs.id"
        }
      },
      signups: {
        relation: Model.HasManyRelation,
        modelClass: Signup, 
        join: {
          from: "students.id",
          to: "signups.studentId"
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

module.exports = Student