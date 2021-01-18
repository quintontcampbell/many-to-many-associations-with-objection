const getDatabaseUrl = (nodeEnv) => {
  return (
    {
      development: "postgres://postgres:postgres@localhost:5432/many-to-many-associations-with-objection_development",
      test: "postgres://postgres:postgres@localhost:5432/many-to-many-associations-with-objection_test",
    }[nodeEnv] || process.env.DATABASE_URL
  );
};

module.exports = getDatabaseUrl;
