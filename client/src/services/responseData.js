export const unwrap = (response) => response.data?.data
export const unwrapList = (response) => ({ data: response.data?.data || [], meta: response.data?.meta || null })
