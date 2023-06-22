const handleDeleteReturnCols = (resource: unknown, returnCols: string[]) => {
  if (process.env.NODE_ENV === "test") return resource;

  returnCols.forEach((col) => {
    delete resource[col];
  });

  return resource;
};

export default handleDeleteReturnCols;
