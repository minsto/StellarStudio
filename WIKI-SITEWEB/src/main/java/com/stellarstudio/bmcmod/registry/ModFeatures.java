package com.stellarstudio.bmcmod.registry;

import com.stellarstudio.bmcmod.BmcMod;
import com.stellarstudio.bmcmod.worldgen.feature.HollowGardenCalciteScatterFeature;
import com.stellarstudio.bmcmod.worldgen.feature.PondConfiguration;
import com.stellarstudio.bmcmod.worldgen.feature.HollowGardenNebrithNoduleFeature;
import com.stellarstudio.bmcmod.worldgen.feature.HollowGardenObsidianSpireFeature;
import com.stellarstudio.bmcmod.worldgen.feature.HollowGardenPondFeature;
import com.stellarstudio.bmcmod.worldgen.feature.HollowGardenTallGrassFeature;
import com.stellarstudio.bmcmod.worldgen.feature.StellarGroveBushFeature;
import com.stellarstudio.bmcmod.worldgen.feature.StellarGroveStoneClusterFeature;

import net.minecraft.core.registries.Registries;
import net.minecraft.world.level.levelgen.feature.Feature;
import net.minecraft.world.level.levelgen.feature.configurations.NoneFeatureConfiguration;

import net.neoforged.neoforge.registries.DeferredHolder;
import net.neoforged.neoforge.registries.DeferredRegister;

public final class ModFeatures {
    public static final DeferredRegister<Feature<?>> FEATURES = DeferredRegister.create(Registries.FEATURE, BmcMod.MODID);

    public static final DeferredHolder<Feature<?>, Feature<NoneFeatureConfiguration>> HOLLOW_GARDEN_OBSIDIAN_SPIRE = FEATURES.register(
            "hollow_garden_obsidian_spire",
            () -> new HollowGardenObsidianSpireFeature(NoneFeatureConfiguration.CODEC));

    public static final DeferredHolder<Feature<?>, Feature<PondConfiguration>> HOLLOW_GARDEN_POND = FEATURES.register(
            "hollow_garden_pond",
            () -> new HollowGardenPondFeature(PondConfiguration.CODEC));

    public static final DeferredHolder<Feature<?>, Feature<NoneFeatureConfiguration>> HOLLOW_GARDEN_CALCITE_SCATTER = FEATURES.register(
            "hollow_garden_calcite_scatter",
            () -> new HollowGardenCalciteScatterFeature(NoneFeatureConfiguration.CODEC));

    public static final DeferredHolder<Feature<?>, Feature<NoneFeatureConfiguration>> HOLLOW_GARDEN_NEBRITH_NODULE = FEATURES.register(
            "hollow_garden_nebrith_nodule",
            () -> new HollowGardenNebrithNoduleFeature(NoneFeatureConfiguration.CODEC));

    public static final DeferredHolder<Feature<?>, Feature<NoneFeatureConfiguration>> HOLLOW_GARDEN_TALL_GRASS = FEATURES.register(
            "hollow_garden_tall_grass",
            () -> new HollowGardenTallGrassFeature(NoneFeatureConfiguration.CODEC));

    public static final DeferredHolder<Feature<?>, Feature<NoneFeatureConfiguration>> STELLAR_GROVE_STONE_CLUSTER = FEATURES.register(
            "stellar_grove_stone_cluster",
            () -> new StellarGroveStoneClusterFeature(NoneFeatureConfiguration.CODEC));

    public static final DeferredHolder<Feature<?>, Feature<NoneFeatureConfiguration>> STELLAR_GROVE_BUSH = FEATURES.register(
            "stellar_grove_bush",
            () -> new StellarGroveBushFeature(NoneFeatureConfiguration.CODEC));

    private ModFeatures() {
    }
}
