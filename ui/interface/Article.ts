export interface ArticleListItem {
    id: number
    title: string
    date: string
    imageUrl: string
    summary: string
    tags: string[]
}

export interface ArticleItem {
    id: number
    title: string
    date: string
    imageUrl: string
    content: string
    tags: string[]
}
