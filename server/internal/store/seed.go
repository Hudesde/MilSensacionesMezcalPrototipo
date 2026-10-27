package store

// SeedProducts son los datos provisionales del prototipo. Precios, graduación e
// inventario se reemplazan con los que confirme el cliente (SRS, Sección 6).
func SeedProducts() []Product {
	return []Product{
		{
			ID: "espadin", Name: "Mezcal Espadín Joven 750ml", PriceCents: 85000, Stock: 120,
			Image: "assets/img/botellasPrimerPlano/espadin/EspadinPP02.jpeg", ABV: "45% Alc. Vol.",
			Description: "Agave Angustifolia Haw, cocido en horno cónico de tierra.",
		},
		{
			ID: "ensamble", Name: "Ensamble de Agaves 750ml", PriceCents: 125000, Stock: 60,
			Image: "assets/img/botellasPrimerPlano/Ensamble.jpeg", ABV: "47% Alc. Vol.",
			Description: "Micro-lote con co-cocción y co-fermentación de varios agaves.",
		},
		{
			ID: "silvestre", Name: "Mezcal Silvestre 750ml", PriceCents: 145000, Stock: 40,
			Image: "assets/img/botellasPrimerPlano/Silvestre01.jpeg", ABV: "48% Alc. Vol.",
			Description: "Agaves recolectados en los cerros de Yautepec.",
		},
		{
			ID: "curados", Name: "Curados de Mezcal 750ml", PriceCents: 75000, Stock: 80,
			Image: "assets/img/botellasPrimerPlano/Curado01.jpeg", ABV: "38% Alc. Vol.",
			Description: "Maceración natural con maracuyá y frutas de temporada.",
		},
	}
}
