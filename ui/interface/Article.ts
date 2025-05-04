export interface ArticleListItem {
    id: string | number
    title: string
    date: string
    imageUrl: string
    summary: string
    tags: string[]
}

export interface ArticleItem {
    id: string | number
    title: string
    date: string
    imageUrl: string
    content: string
    tags: string[]
}
