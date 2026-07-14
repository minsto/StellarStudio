package com.stellarstudio.bmcmod.worldgen;

import org.slf4j.Logger;

import com.stellarstudio.bmcmod.BmcMod;

import net.minecraft.core.Holder;
import net.minecraft.core.registries.Registries;
import net.minecraft.resources.ResourceKey;
import net.minecraft.server.MinecraftServer;
import net.minecraft.world.level.biome.Biome;
import net.neoforged.neoforge.server.ServerLifecycleHooks;

/**
 * Biomes datapack du mod ; les {@link Holder} sont résolus côté serveur pour les mixins de bruit (End, Overworld)
 * et les checks de gameplay.
 */
public final class ModBiomes {
    private static final Logger LOGGER = BmcMod.LOGGER;

    public static final ResourceKey<Biome> HOLLOW_GARDEN = ResourceKey.create(Registries.BIOME, BmcMod.loc("hollow_garden"));
    /** Bosquet tropical Sunwood près des côtes chaudes (placement via mixin bruit multi-noise). */
    public static final ResourceKey<Biome> STELLAR_GROVE = ResourceKey.create(Registries.BIOME, BmcMod.loc("stellar_grove"));

    private static volatile Holder<Biome> hollowGardenHolder;
    private static volatile Holder<Biome> stellarGroveHolder;

    private ModBiomes() {
    }

    public static void cacheBiomeHolders(MinecraftServer server) {
        if (server == null) {
            return;
        }
        try {
            var lookup = server.registryAccess().lookupOrThrow(Registries.BIOME);
            hollowGardenHolder = lookup.get(HOLLOW_GARDEN).orElse(null);
            stellarGroveHolder = lookup.get(STELLAR_GROVE).orElse(null);
        } catch (Exception e) {
            LOGGER.warn("bmcmod: impossible de mettre en cache les biomes du mod (Soleá / Hollow Garden) — substitution désactivée jusqu’au prochain chargement.", e);
            hollowGardenHolder = null;
            stellarGroveHolder = null;
        }
    }

    public static void clearBiomeHolders() {
        hollowGardenHolder = null;
        stellarGroveHolder = null;
    }

    /**
     * Utilisé par le mixin End. Résolution paresseuse si le cache n’a pas encore tourné (évite que le biome ne
     * s’applique pas avant {@code ServerStartedEvent}).
     */
    public static Holder<Biome> hollowGardenHolder() {
        if (hollowGardenHolder != null) {
            return hollowGardenHolder;
        }
        MinecraftServer server = ServerLifecycleHooks.getCurrentServer();
        if (server != null) {
            cacheBiomeHolders(server);
        }
        return hollowGardenHolder;
    }

    public static Holder<Biome> stellarGroveHolder() {
        if (stellarGroveHolder != null) {
            return stellarGroveHolder;
        }
        MinecraftServer server = ServerLifecycleHooks.getCurrentServer();
        if (server != null) {
            cacheBiomeHolders(server);
        }
        return stellarGroveHolder;
    }
}
