In this article, we will examine how to manage a slightly more advanced database relationship with Objection and Knex: many-to-many relationships.

### Learning Goals

* Be able to determine when a many-to-many association is needed
* Create the necessary migrations for a many-to-many association
* Discover how to configure a many-to-many association on the model level in order to more easily query related records
* Examine how we can query effectively once the appropriate associations have been setup

### Getting Setup

```
et get many-to-many-associations-with-objection
cd get many-to-many-associations-with-objection
yarn install

cd server
createdb many-to-many-associations-with-objection_development
yarn migrate:latest
yarn db:seed

cd ..
yarn run dev
```

For this lesson, files and code have already been created for you. Navigating to <http://localhost:3000> should show you the text "Clubs Available to Join at Launch Academy University" with a few clubs listed on the page.

Navigate to `"/clubs"` and `"/clubs/1"` to familiarize yourself with the current application. These routes render a list of clubs, and details for a club including students that have signed up for that club, respectively. Ensure that you familiarize yourself with each of the components in the `client/src/components` folder to get a sense of the frontend UI.

### What We Know Thus Far

Thus far, we've learned how we can set up one-to-many associations between different objects using Objection, in order to more easily query records in our Express applications. Now, we will want to learn how to configure one other type of relationship for our full-stack web applications as well: the many-to-many association.

Consider an application where we allow users to track all of the books that they own. The ER diagram below depicts a relationship between a person entity and a book entity:

<img src="https://horizon-production.s3.amazonaws.com/images/one-to-many.png" width="600" />

In this case, it may come easily that the relationship between the two entities is a one-to-many relationship. Generally, a person can own many books, and a book generally belongs to just one person. However, what we really need to ask is: "Based on the projected features we wish to build, how will we need to associate these two entities?

If we were instead to build out an application whose focus it is is to list books and their authors, the ER diagram may look like this:

![many-to-many-book][many-to-many-book]

While the entities are largely the same (humans and books), the relationship between a person and a book is different. A person can author many books, AND a book may have many authors. The application we wish to build determines the association, and many to many associations will often be present in our web apps!

### Many to Many Associations: The Challenge

Many-to-many relationships present a few challenges for our database and model setup, as compared to a one-to-many relationship. In the one-to-many relationship that we discussed between a person and book entity, we would need to generate two migrations: one for a `persons` table and one for a `books` table. Next, we would need to determine where we would store a foreign key in this relationship, which is integral to being able to query which person a given book belongs to. In this case, the `books` table would have a `personId` foreign key column. The inverse of this is of course much less ideal: storing a `bookIds` column on the `persons` table wouldn't make much sense, since we would have to maintain an array of book ids in said column in order to track all of the books that belongs to a person! This insight provides us with another important concept to keep in mind with many-to-many associations: **we will most often store a foreign key on the entity that has a `BelongsToOneRelation` relation.**

The challenge is that in a many-to-many relationship there are essentially two `HasManyRelation` relations, making it more difficult to track foreign keys on one table or the other. This is why with many-to-many associations, we need something called a **join table** to help track these foreign keys instead. We will, of course, also need an improved Objection configuration to be able to query according to this new database schema.

### Tables for a Many to Many

Let's consider a new ER diagram for the rest of this lesson between **students** and **clubs** that students might partake in at school. In our web application that we wish to build, this might be a tool that students can use to sign up for clubs virtually, and also see which other students might be in a club that they are interested in. A student can sign up for many clubs, and a club can have many students partake in its activities.

![Image of table indicating that students and clubs have a many-to-many relationship, and an ER diagram with chicken feet pointing in.][many-to-many]

We've seen this type of many-to-many relationship before, but we'll need to update this ER diagram to account for our new join table.

![Image of table indicating that students and clubs have a many-to-many relationship, and an ER diagram with the join table "signups" added][many-to-many-join]

We now have a table `signups` whose primary responsibility it is to keep stock of the many different pairs of one student and one club. In this way, we could say that a student and a club are related to one another *through* the `signups` table. Once we look closely, we will also see that there are also two one-to-many relationships in this diagram as well; one between `students` and `signups` and one between `clubs` and `signups`.

This will make more sense if we look at some example tables

![many-to-many-table][many-to-many-table]

In this example, we can see that both "Kipo Oak" and "Tina Belcher" have both signed up for "A Cappella Group". We can determine this because on the `signups` table, there are two records with a `clubId` of 2. Each of these records also have `studentId`s of 2 and 3 which point to Kipo and Tina. To reiterate, a record in the `signups` table represents just one individual signup of a single student to a single club.

There is also a student who has signed up for two different clubs. Following our earlier logic, we can see that "Bart Simpson" (students.id: 4) has signed up for both the "Hiking Club" (clubs.id: 3) and "Robotics" (clubs.id: 4).

This configuration of the three tables ("students", "clubs", and the join table of "signups") satisfies the feature we wish to develop, so we just need to generate the appropriate Knex migrations for the database schema.

### Knex Migrations for Many to Many

The Knex migrations for our `students` and `clubs` tables already exist in the provided app, and are fairly straightforward:

```js
/// server/src/db/migrations/20201222155927_createStudents.cjs

exports.up = async (knex) => {
  return knex.schema.createTable("students", (table) => {
    table.bigIncrements("id")
    table.string("name")
    table.timestamp("createdAt").notNullable().defaultTo(knex.fn.now())
    table.timestamp("updatedAt").notNullable().defaultTo(knex.fn.now())
  })
};

///...
exports.down = async (knex) => {
  return knex.schema.dropTableIfExists("students")
};
```

```js
/// server/src/db/migrations/20201222155933_createClubs.cjs

exports.up = async (knex) => {
  return knex.schema.createTable("clubs", (table) => {
    table.bigIncrements("id")
    table.string("name")
    table.timestamp("createdAt").notNullable().defaultTo(knex.fn.now())
    table.timestamp("updatedAt").notNullable().defaultTo(knex.fn.now())
  })
};

///...

exports.down = async (knex) => {
  return knex.schema.dropTableIfExists("clubs")
};
```

Notice that neither of these tables have foreign key columns, because they do not hold the "many" side of the relationship. Our `signups` table will instead hold these foreign keys.

```js
/// server/src/db/migrations/20201222180953_createSignups.cjs

exports.up = async (knex) => {
  return knex.schema.createTable("signups", (table) => {
    table.bigIncrements("id")
    table.bigInteger("clubId").unsigned().index().references("clubs.id");
    table.bigInteger("studentId").unsigned().index().references("students.id");
    table.timestamp("createdAt").notNullable().defaultTo(knex.fn.now())
    table.timestamp("updatedAt").notNullable().defaultTo(knex.fn.now())
  })
};

///...

exports.down = async (knex) => {
  return knex.schema.dropTableIfExists("signups")
};
```

In this migration there aren't any new keywords to review, since we already learned how to add foreign keys with one-to-many relationships, but we are adding two foreign keys to a table at once. Each foreign key is still a positive integer that is a reference to a primary key in either the `clubs` or `students` table.

### Objection relationMappings for Many to Many

We've setup our schema, now we just need to update our models so that we can easily query related records (for example, if we want to find out which students signed up for a particular club). We will need to update the special static `relationMappings` method (the same one we used for our one-to-many associations!) with our new many-to-many associations.

```js
/// server/src/models/Club.js

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
    ///
```

Within our `Club` model above, we define a property `students` that will be used any time we wish to call the `$relatedQuery` method to find which students are signed up for a club. We need the `relation`, `modelClass` and `join` sub-properties in order for our `relationMappings` association to work as expected.  We're using a new style of relation here: `Model.ManyToManyRelation`. The `modelClass` key should point to the `Student` class, since it is student records that we will wish to retrieve for a given club.

The `join` property will look slightly different for a many-to-many relationship compared to a one-to-many. `from` and `to` are once again present, designating the id of which club we are querying for, and the many ids of students we are trying to retrieve. However, because our `signups` table holds all of the relevant ids for clubs and students, we'll need to add a `through` property as well, so that Objection knows how to connect the two models (or which join table to go "through"). Order matters, so we need the `from` property _inside_ of our `through` objection to be `signups.clubId`, and the `to` property inside `through` to be `signups.studentId`. This tells Objection that if it's working with Club #1, it can find any related signups on the "signups" table with a `clubId` of `1`. Then, it can use the `studentId`s for those signups to find the related Student records.

As such, let's say we call on the below code:

```js
const dramaClub = await Club.query().findById(1)
const dramaStudents = await dramaClub.$relatedQuery("students")
```

Objection will first query the "signups" table for records with a matching `clubId` of `1`, and obtain all related `studentId`s. Once the ids are retrieved, Objection will retrieve the student records with those ids and return them in an array of Student objects. Remember to refer back to our earlier diagram of example tables if this gets a bit dizzying.

#### Adding Our Relationship Inverse

We'll need to define the inverse `relationMapping` for our `Student` model as well so that we can query both ways. In our `Student` model, we'll see the following set up:

```js
/// server/src/models/Student.js

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
      ...
```

Here, we're telling Objection that, given the student Bart Simpson, it should first look for "signups" with a `studentId` matching Bart's id (`4`), then look at the corresponding `clubId`s and put the related clubs into an array for us.

At this point, our `$relatedQuery` method should work, though there is one final step we will want to make before we get querying.

### One-to-Many Relationships In Our Many to Many

We've updated our `Club` and `Student` models, but not our `Signup` model! While not immediately necessary, there will also be times when we work directly with `Signup` objects, and need to retrieve the related student or club record for a given signup object. We also may wish to retrieve all signups for a given student or club.

Behind the scenes of every many-to-many relationship, we have two one-to-many relationships happening with a join table. While we already defined the many-to-many relationships on our `Club` and `Student` models, we have not yet defined anything related to the one-to-many relationships. We know we'll want to define both sides, so let's start by defining our "one" side of the relationships on our `Signup` model.

```js
/// server/src/models/Signup.js

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
```
These relationMappings should be familiar to you! That is because **for every many-to-many relationship, there are usually also two one-to-many relationships**. In this case, we've defined the appropriate `BelongsToOneRelation` relationMappings so that we can retrieve records relating to a single signup. We'll want to also define the inverse relationMappings for these two one-to-many relationships on `Club` and `Student` respectively. This has also already been done in the appropriate files.


```js
/// server/src/models/Club.js

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
```

```js
/// server/src/models/Student.js

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
```

What you'll notice here is that our `relationshipMappings` method can hold multiple different relationships within it! We first have our `clubs` `ManyToManyRelation`, but we can also add a second key-value pair of `signups` with a simpler one-to-many `HasManyRelation`.

### Adding Related Records

Now that we have everything setup, how does this work in practice? Let's review the provided `Seeder.js` file, which was executed when we seeded our app at the start of the lesson. Each of the queries we observe in this file could also be run in our REPL console or in an Express router endpoint.

```js
/// article/many-to-many-associations-with-objection/server/src/db/Seeder.js

class Seeder {
  static async seed() {
    console.log("seeding...");
    const robotics = await Club.query().insert({name: "Robotics Club" })
    const acappella = await Club.query().insert({name: "A Cappella Group" })

    await robotics.$relatedQuery('students').insert({ name: 'Bart Simpson' })
    await robotics.$relatedQuery('students').insert({ name: 'Steven Universe' })

    await acappella.$relatedQuery('students').insert({ name: 'Kipo Oak' })
    await acappella.$relatedQuery('students').insert({ name: 'Tina Belcher' })


    console.log("Done!");
    await connection.destroy();
  }
}
```

Our `$relatedQuery` inserts are written in nearly the same way as when we worked with one-to-many relationships! In this file, we can see that we add two club records and four student records that we immediately relate to either `robotics` or `acappella`. Under the hood, each time we added a new student to a related club, a `signup` record was also created in our database to track the relationship. Without setting up our `relationMappings` we would have needed to manually create a `Signup` record every time we wanted to relate a student and a club.

### Querying Related Objection Records in Express

Let's also examine how we would retrieve related records in an Express router. When we navigate to `/clubs/1`, we should expect to see the details for a specific club as well as all of the students that have chosen to signup for that club. Once we navigate to this path, our `ClubShowPage` component will make a fetch request upon mounting, to `api/v1/clubs/:id`:

```js
/// server/src/routes/api/v1/clubsRouter.js

clubRouter.get("/:id", async (req, res) => {
  const { id } = req.params

  try {
    const club = await Club.query().findById(id)
    club.students = await club.$relatedQuery("students")
    return res.status(200).json({ club: club })
  } catch(error){
    return res.status(500).json({ errors: error })
  }
})
```

Once again, because we have correctly set up the associations in our application, our `$relatedQuery` works! We can now return all of the students that signed up for a specific club with ease.

### Why This Matters

The records we persist in our database will have many complex relationships, and handling many-to-many relationships in our applications will often be commonplace, even if the configuration takes a bit of doing. By setting up these associations on our model, we'll be able to write more efficient queries which help keep our models rich with business logic and our controllers skinny.

### In Summary

In this article, we examined how to setup our database tables and Objection models to handle many-to-many relationships between entities in our apps. Once again, a proper ER diagram is important to help visualize these relationships. We made note that the features we wish to deliver on in our applications help us determine the types of relationships we will have to configure for. Our ER diagram led us to determine that we need a join table in order to track the many relationships that two entities, such as a student and club, can have.

Our join table, which we called `signups`, needs its own migration so that we can track foreign keys correctly. Each new record in our signups table represents an instance of a student and club relating to one another.

Finally, we configured our three models to allow for querying records in a many-to-many relationship. The key differentiator of a many-to-many relationMapping is the `through` property, which allows Objection to determine how to lookup relationships in a join table. We also discovered that for every many-to-many relationship, there are also often two one-to-many `relationMappings` that we may wish to define.

### Resources
* [Relation Queries](https://vincit.github.io/objection.js/guide/query-examples.html#relation-queries)
* [Related Query](https://vincit.github.io/objection.js/api/model/instance-methods.html#relatedquery)

[many-to-many-join]:https://horizon-production.s3.amazonaws.com/images/signups-many-many.png
[many-to-many]:https://horizon-production.s3.amazonaws.com/images/many-to-many-books.png
[one-to-many]:https://horizon-production.s3.amazonaws.com/images/one-to-many.png
[many-to-many-book]:https://horizon-production.s3.amazonaws.com/images/many-to-many-book.png
[many-to-many-table]:https://horizon-production.s3.amazonaws.com/images/relationship-many-table.png
