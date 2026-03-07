package handler

import (
	"net/http"

	"github.com/Inc-Tarelka/api/internal/model"
	"github.com/Inc-Tarelka/api/internal/service"
	"github.com/gin-gonic/gin"
)

type ReferenceHandler struct {
	referenceService service.ReferenceService
}

func NewReferenceHandler(referenceService service.ReferenceService) *ReferenceHandler {
	return &ReferenceHandler{referenceService: referenceService}
}

// GetSpecializations godoc
// @Summary Список специализаций
// @Description Получение списка всех специализаций
// @Tags references
// @Produce json
// @Success 200 {array} model.Specialization
// @Failure 500 {object} model.ErrorResponse
// @Router /references/specializations [get]
func (h *ReferenceHandler) GetSpecializations(c *gin.Context) {
	specs, err := h.referenceService.GetSpecializations(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, model.ErrorResponse{Error: "internal_error"})
		return
	}

	c.JSON(http.StatusOK, specs)
}

// GetDirections godoc
// @Summary Список направлений
// @Description Получение списка всех направлений
// @Tags references
// @Produce json
// @Success 200 {array} model.Direction
// @Failure 500 {object} model.ErrorResponse
// @Router /references/directions [get]
func (h *ReferenceHandler) GetDirections(c *gin.Context) {
	dirs, err := h.referenceService.GetDirections(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, model.ErrorResponse{Error: "internal_error"})
		return
	}

	c.JSON(http.StatusOK, dirs)
}

// GetCities godoc
// @Summary Список городов
// @Description Получение списка всех городов
// @Tags references
// @Produce json
// @Success 200 {array} model.City
// @Failure 500 {object} model.ErrorResponse
// @Router /references/cities [get]
func (h *ReferenceHandler) GetCities(c *gin.Context) {
	cities, err := h.referenceService.GetCities(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, model.ErrorResponse{Error: "internal_error"})
		return
	}

	c.JSON(http.StatusOK, cities)
}

// GetPublicationTags godoc
// @Summary Список тегов публикаций
// @Description Получение списка всех тегов публикаций
// @Tags references
// @Produce json
// @Success 200 {array} model.PublicationTagRef
// @Failure 500 {object} model.ErrorResponse
// @Router /references/publication-tags [get]
func (h *ReferenceHandler) GetPublicationTags(c *gin.Context) {
	tags, err := h.referenceService.GetPublicationTags(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, model.ErrorResponse{Error: "internal_error"})
		return
	}

	c.JSON(http.StatusOK, tags)
}

// GetNeedTags godoc
// @Summary Список тегов потребностей
// @Description Получение списка всех тегов потребностей
// @Tags references
// @Produce json
// @Success 200 {array} model.NeedTagRef
// @Failure 500 {object} model.ErrorResponse
// @Router /references/need-tags [get]
func (h *ReferenceHandler) GetNeedTags(c *gin.Context) {
	tags, err := h.referenceService.GetNeedTags(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, model.ErrorResponse{Error: "internal_error"})
		return
	}

	c.JSON(http.StatusOK, tags)
}
