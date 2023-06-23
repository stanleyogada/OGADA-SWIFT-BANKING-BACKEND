const handleDeleteReturnCols = <TResource>(resource: TResource, returnCols: Array<keyof TResource>) => {
  if (process.env.NODE_ENV === "test") return resource;

  returnCols.forEach((col) => {
    delete resource[col];
  });

  return resource;
};

export default handleDeleteReturnCols;
