import { Box, Button, Grid } from "@mui/material";
import { useEffect, useState } from "react";
import { useMap } from "geocommuns-core";

import { City, getCities } from "../api/geoApiGouv";
import { Legend } from "../components/Legend";
import TextFieldWithOptions from "../components/TextFieldWithOptions";
import { makeStyles } from "tss-react/dsfr";
import { OpacitySlider } from "../components/OpacitySlider";
import { fr } from "@codegouvfr/react-dsfr";

const ORIGINAL_CENTER: [number, number] = [2.5764414841767787, 46.51407673990174];
const ORIGINAL_ZOOM = 5;

const useStyles = makeStyles()({
  title: {
    // marginBottom: fr.spacing("4w"),
  },
  layers: {
    marginBottom: fr.spacing("4w"),
  },
});

// TODO : debounce à mettre en place
const MapExtentSelector = () => {
  const [inputText, setInputText] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [cityPropositions, setCityPropositions] = useState<City[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { classes } = useStyles();

  const { setNewCenterAndNewZoom, fitViewToPolygon, setLayerOpacity } = useMap(
    "map",
    ORIGINAL_CENTER,
    ORIGINAL_ZOOM,
    ["ortho", "admin", "aiPrediction"]
  );

  useEffect(() => {
    if (inputText.length <= 3 || selectedCity !== null) return;

    setIsLoading(true);
    getCities(inputText)
      .then((res) => {
        setCityPropositions(res.data);
      })
      .catch((e) => console.warn("error " + e))
      .finally(() => setIsLoading(false));
  }, [inputText, selectedCity]);

  useEffect(() => {
    if (selectedCity === null) {
      setNewCenterAndNewZoom(ORIGINAL_CENTER, ORIGINAL_ZOOM);
      return;
    }

    fitViewToPolygon(selectedCity.contour.coordinates);
  }, [selectedCity]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Grid
        container
        spacing={2}
        sx={{
          mt: 2,
          mb: 2,
          width: "90%",
          maxWidth: 1200,
        }}
      >
        <Grid item xs={12} md={8}>
          <Box id="map" sx={{ height: "100%", minHeight: 800, maxHeight: 1000 }} />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextFieldWithOptions<City>
            value={selectedCity}
            setValue={setSelectedCity}
            inputValue={inputText}
            setInputValue={setInputText}
            options={cityPropositions}
            isLoading={isLoading}
            getOptionLabel={(option: City) => {
              const label = option.nom;
              if (option.codesPostaux.length === 1) return label + ", " + option.codesPostaux[0];
              return label;
            }}
          />

          <Button
            variant="contained"
            fullWidth
            sx={{ mt: 1, p: 2, mb: 3 }}
            onClick={() => console.log("click")}
            disabled={selectedCity === null}
          >
            Extraire
          </Button>

          <div className={classes.layers}>
            <h6 className={classes.title}>Calques</h6>
            <OpacitySlider label="COSIA" layer="aiPrediction" setLayerOpacity={setLayerOpacity} />
            <OpacitySlider
              label="Prise de vues aériennes"
              layer="ortho"
              setLayerOpacity={setLayerOpacity}
            />
            <OpacitySlider
              label="Limites administratives"
              layer="admin"
              setLayerOpacity={setLayerOpacity}
            />
          </div>
          <Legend />
        </Grid>
      </Grid>
    </Box>
  );
};

export default MapExtentSelector;
