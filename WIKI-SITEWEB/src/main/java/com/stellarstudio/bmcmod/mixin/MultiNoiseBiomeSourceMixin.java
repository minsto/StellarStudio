package com.stellarstudio.bmcmod.mixin;

import java.util.stream.Stream;

import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfoReturnable;

import net.minecraft.core.Holder;
import net.minecraft.server.MinecraftServer;
import net.minecraft.world.level.biome.Biome;
import net.minecraft.world.level.biome.Climate;
import net.minecraft.world.level.biome.MultiNoiseBiomeSource;

import com.stellarstudio.bmcmod.worldgen.ModBiomes;
import com.stellarstudio.bmcmod.worldgen.StellarGrovePlacement;

import net.neoforged.neoforge.server.ServerLifecycleHooks;

/**
 * Soleá Grove : ajout au flux {@link MultiNoiseBiomeSource#collectPossibleBiomes()} puis substitution dans
 * {@code getNoiseBiome} — <strong>les deux</strong> surcharges (coordonnées + sampler <em>et</em> TargetPoint),
 * car la génération des chunks utilise souvent uniquement {@code getNoiseBiome(Climate.TargetPoint)}.
 */
@Mixin(MultiNoiseBiomeSource.class)
public abstract class MultiNoiseBiomeSourceMixin {

    @Inject(method = "collectPossibleBiomes", at = @At("HEAD"))
    private void bmcmod$cacheStellarBeforeCollectPossibleBiomes(CallbackInfoReturnable<Stream<Holder<Biome>>> cir) {
        cacheStellarHolder();
    }

    @Inject(method = "collectPossibleBiomes", at = @At("RETURN"), cancellable = true)
    private void bmcmod$addStellarGroveToCollectPossibleBiomes(CallbackInfoReturnable<Stream<Holder<Biome>>> cir) {
        Holder<Biome> stellar = ModBiomes.stellarGroveHolder();
        if (stellar == null) {
            return;
        }
        Stream<Holder<Biome>> base = cir.getReturnValue();
        if (base == null) {
            cir.setReturnValue(Stream.of(stellar));
            return;
        }
        cir.setReturnValue(Stream.concat(base, Stream.of(stellar)));
    }

    @Inject(method = "getNoiseBiome(IIILnet/minecraft/world/level/biome/Climate$Sampler;)Lnet/minecraft/core/Holder;", at = @At("HEAD"))
    private void bmcmod$cacheStellarHolderBeforeNoiseInt(int x, int y, int z, Climate.Sampler sampler, CallbackInfoReturnable<Holder<Biome>> cir) {
        cacheStellarHolder();
    }

    @Inject(method = "getNoiseBiome(IIILnet/minecraft/world/level/biome/Climate$Sampler;)Lnet/minecraft/core/Holder;", at = @At("RETURN"), cancellable = true)
    private void bmcmod$stellarGroveInt(int x, int y, int z, Climate.Sampler sampler, CallbackInfoReturnable<Holder<Biome>> cir) {
        applyStellarIfEligible(cir, sampler.sample(x, y, z));
    }

    @Inject(method = "getNoiseBiome(Lnet/minecraft/world/level/biome/Climate$TargetPoint;)Lnet/minecraft/core/Holder;", at = @At("HEAD"))
    private void bmcmod$cacheStellarHolderBeforeNoiseTp(Climate.TargetPoint point, CallbackInfoReturnable<Holder<Biome>> cir) {
        cacheStellarHolder();
    }

    @Inject(method = "getNoiseBiome(Lnet/minecraft/world/level/biome/Climate$TargetPoint;)Lnet/minecraft/core/Holder;", at = @At("RETURN"), cancellable = true)
    private void bmcmod$stellarGroveTargetPoint(Climate.TargetPoint point, CallbackInfoReturnable<Holder<Biome>> cir) {
        applyStellarIfEligible(cir, point);
    }

    private static void cacheStellarHolder() {
        MinecraftServer server = ServerLifecycleHooks.getCurrentServer();
        if (server != null) {
            ModBiomes.cacheBiomeHolders(server);
        }
    }

    private static void applyStellarIfEligible(CallbackInfoReturnable<Holder<Biome>> cir, Climate.TargetPoint point) {
        Holder<Biome> vanilla = cir.getReturnValue();
        if (vanilla == null) {
            return;
        }
        Holder<Biome> stellar = ModBiomes.stellarGroveHolder();
        if (stellar == null || vanilla.is(stellar)) {
            return;
        }
        if (!StellarGrovePlacement.shouldReplaceWithStellarGrove(vanilla, point)) {
            return;
        }
        cir.setReturnValue(stellar);
    }
}
