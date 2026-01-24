package model

// Specialization - справочник специализаций
type Specialization struct {
	ID   int64  `json:"id" db:"id"`
	Name string `json:"name" db:"name"`
}

// Direction - справочник направлений
type Direction struct {
	ID   int64  `json:"id" db:"id"`
	Name string `json:"name" db:"name"`
}

// City - справочник городов
type City struct {
	ID   int64  `json:"id" db:"id"`
	Name string `json:"name" db:"name"`
}
