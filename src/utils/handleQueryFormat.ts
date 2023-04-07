const handleWhereQuery = (payload: Record<string, unknown>, payloadCols: string[]) => {
  payloadCols = payloadCols.filter((col) => payload[col] || payload[col] === null);
  if (!payloadCols.length) throw new Error("`req.body` cannot by empty!");

  const mappedPayloadCols = [];

  for (let i = 0; i < payloadCols.length; i++) {
    const col = payloadCols[i];
    const val = payload[col];

    const isLastCol = i + 1 === payloadCols.length;
    let q = `${col} = ${`$${i + 1}`}`;
    q += `${!isLastCol ? "AND " : ""}`;

    mappedPayloadCols.push({
      col,
      q,
      val,
    });
  }

  const queryDeps = mappedPayloadCols.map(({ val }) => val);
  const q = mappedPayloadCols.map(({ q }) => q).join("");

  return {
    q,
    queryDeps,
  };
};

const handlePatchSetQuery = (findPayload: Record<string, unknown>, updatePayload: Record<string, unknown>) => {
  const whereColumns = Object.keys(findPayload);
  const updateColumns = Object.keys(updatePayload);

  if (!whereColumns.length) throw new Error("Cannot update an empty record! Must provide where columns");
  if (!updateColumns.length) throw new Error("Must provide update columns!");

  const mappedColumns: Array<{ column: string; query: string; value: string }[]> = [];

  const handleMap =
    (payload: Record<string, unknown>, initCount: number = 0) =>
    (column: string, i: number) => {
      const query = `${column} = $${i + 1 + initCount}`;
      const value = payload[column] as string;

      return {
        column,
        query,
        value,
      };
    };

  mappedColumns[0] = whereColumns.map(handleMap(findPayload));
  mappedColumns[1] = updateColumns.map(handleMap(updatePayload, mappedColumns[0].length));

  const queryDependencies = [...mappedColumns[0], ...mappedColumns[1]].map(({ value }) => value);
  const whereQuery = mappedColumns[0].map(({ query }) => query).join(" AND ");
  const setQuery = mappedColumns[1].map(({ query }) => query).join(", ");

  return {
    queryDependencies,
    whereQuery,
    setQuery,
  };
};

const handleInsertQuery = (payload: Record<string, unknown>) => {
  const columns = Object.keys(payload);
  const query = `(${columns.join(", ")}) 
  VALUES (${columns.map((_: string, i: number) => `$${i + 1}`).join(", ")})`;

  const queryDependencies = columns.map((column) => payload[column]) as string[];

  return {
    query,
    queryDependencies,
  };
};

export { handleWhereQuery, handlePatchSetQuery, handleInsertQuery };
