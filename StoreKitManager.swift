import Foundation
import StoreKit

class StoreKitManager: NSObject {
    static let shared = StoreKitManager()
    private let productId = "com.moodtracker.daily.premium.monthly"
    private var product: Product?

    func loadProduct() async {
        do {
            let products = try await Product.products(for: [productId])
            self.product = products.first
        } catch {
            print("StoreKit: product load failed \(error)")
        }
    }

    func purchase(completion: @escaping (Bool) -> Void) {
        Task {
            guard let product = product else {
                await loadProduct()
                guard let product = self.product else {
                    DispatchQueue.main.async { completion(false) }
                    return
                }
                try? await buy(product: product, completion: completion)
                return
            }
            try? await buy(product: product, completion: completion)
        }
    }

    private func buy(product: Product, completion: @escaping (Bool) -> Void) async throws {
        let result = try await product.purchase()
        switch result {
        case .success(let verification):
            switch verification {
            case .verified(let transaction):
                await transaction.finish()
                DispatchQueue.main.async { completion(true) }
            case .unverified:
                DispatchQueue.main.async { completion(false) }
            }
        default:
            DispatchQueue.main.async { completion(false) }
        }
    }

    func checkActiveSubscription(completion: @escaping (Bool) -> Void) {
        Task {
            for await result in Transaction.currentEntitlements {
                if case .verified(let transaction) = result,
                   transaction.productID == productId {
                    DispatchQueue.main.async { completion(true) }
                    return
                }
            }
            DispatchQueue.main.async { completion(false) }
        }
    }
}
