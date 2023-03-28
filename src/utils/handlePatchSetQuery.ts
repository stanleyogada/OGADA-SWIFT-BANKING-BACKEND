const handlePatchSetQuery = (id: string, payload: unknown, payloadCols: string[]) => {
  payloadCols = ["id", ...payloadCols];
  payloadCols = payloadCols.filter((col) => payload[col] || col === "id");

  if (payloadCols.length === 1) throw new Error("`req.body` cannot by empty!");

  console.log(payloadCols);

  const mappedPayloadCols = [];

  for (let i = 0; i < payloadCols.length; i++) {
    const col = payloadCols[i];
    const val = col === "id" ? id : payload[col];

    let q: string;
    if (col !== "id") {
      const isLastCol = i + 1 === payloadCols.length;
      q = `${col} = ${`$${i + 1}`}`;
      q += `${!isLastCol ? ", " : ""}`;
    }

    mappedPayloadCols.push({
      col,
      q,
      val,
    });
  }

  const queryDeps = mappedPayloadCols.map(({ val }) => val);

  const q = mappedPayloadCols.map(({ q }) => q).join("");

  console.log(payloadCols, mappedPayloadCols, queryDeps, q);

  return {
    q,
    queryDeps,
  };
};

export default handlePatchSetQuery;
