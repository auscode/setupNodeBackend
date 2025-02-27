const paginationData = ({query}) => {
    let {currentPage, limit} = query
    currentPage = parseInt(currentPage || 1)
    limit = parseInt(limit || 10);
    const offset = (currentPage - 1) * limit
    return {offset, limit}
}

module.exports = {paginationData};